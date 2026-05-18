package interview.guide.common.async;

import interview.guide.common.constant.AsyncTaskStreamConstants;
import interview.guide.infrastructure.redis.RedisService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.stream.StreamMessageId;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Redis Stream 消费者模板基类。
 * <p>
 * 将消费循环、ACK、重试与生命周期管理收敛到统一模板，子类仅关注业务处理逻辑。
 */
@Slf4j
public abstract class AbstractStreamConsumer<T> {

    private final RedisService redisService;
    private final int workerCount;
    private final int batchSize;
    private final long pollIntervalMs;
    private final AtomicBoolean running = new AtomicBoolean(false);
    private final List<String> consumerNames = new ArrayList<>();
    private ExecutorService executorService;

    protected AbstractStreamConsumer(RedisService redisService, int workerCount, int batchSize, long pollIntervalMs) {
        this.redisService = redisService;
        this.workerCount = Math.max(1, workerCount);
        this.batchSize = Math.max(1, batchSize);
        this.pollIntervalMs = Math.max(100, pollIntervalMs);
    }

    @PostConstruct
    public void init() {
        try {
            redisService.createStreamGroup(streamKey(), groupName());
            log.info("Redis Stream 消费者组已创建或已存在: {}", groupName());
        } catch (Exception e) {
            log.warn("创建消费者组时发生异常（可能已存在）: {}", e.getMessage());
        }

        AtomicInteger threadIndex = new AtomicInteger(1);
        this.executorService = Executors.newFixedThreadPool(workerCount, r -> {
            Thread t = new Thread(r, threadName() + "-" + threadIndex.getAndIncrement());
            t.setDaemon(true);
            return t;
        });

        running.set(true);
        for (int i = 0; i < workerCount; i++) {
            String consumerName = consumerPrefix() + UUID.randomUUID().toString().substring(0, 8);
            consumerNames.add(consumerName);
            executorService.submit(() -> consumeLoop(consumerName));
        }

        log.info("{}消费者已启动: workers={}, batchSize={}, pollIntervalMs={}, consumerNames={}",
            taskDisplayName(), workerCount, batchSize, pollIntervalMs, consumerNames);
    }

    @PreDestroy
    public void shutdown() {
        running.set(false);
        if (executorService != null) {
            executorService.shutdown();
        }
        log.info("{}消费者已关闭: consumerNames={}", taskDisplayName(), consumerNames);
    }

    private void consumeLoop(String consumerName) {
        while (running.get()) {
            try {
                redisService.streamConsumeMessages(
                    streamKey(),
                    groupName(),
                    consumerName,
                    batchSize,
                    pollIntervalMs,
                    this::processMessage
                );
            } catch (Exception e) {
                if (Thread.currentThread().isInterrupted()) {
                    log.info("消费者线程被中断: consumerName={}", consumerName);
                    break;
                }
                log.error("消费消息时发生错误: consumerName={}, error={}", consumerName, e.getMessage(), e);
            }
        }
    }

    private void processMessage(StreamMessageId messageId, Map<String, String> data) {
        T payload = parsePayload(messageId, data);
        if (payload == null) {
            ackMessage(messageId);
            return;
        }

        int retryCount = parseRetryCount(data);
        log.info("开始处理{}任务: {}, messageId={}, retryCount={}",
            taskDisplayName(), payloadIdentifier(payload), messageId, retryCount);

        try {
            markProcessing(payload);
            processBusiness(payload);
            markCompleted(payload);
            ackMessage(messageId);
            log.info("{}任务完成: {}", taskDisplayName(), payloadIdentifier(payload));
        } catch (Exception e) {
            log.error("{}任务失败: {}, error={}", taskDisplayName(), payloadIdentifier(payload), e.getMessage(), e);
            if (retryCount < AsyncTaskStreamConstants.MAX_RETRY_COUNT) {
                retryMessage(payload, retryCount + 1);
            } else {
                markFailed(payload, truncateError(
                    taskDisplayName() + "失败(已重试" + retryCount + "次): " + e.getMessage()
                ));
            }
            ackMessage(messageId);
        }
    }

    protected int parseRetryCount(Map<String, String> data) {
        try {
            return Integer.parseInt(data.getOrDefault(AsyncTaskStreamConstants.FIELD_RETRY_COUNT, "0"));
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    protected String truncateError(String error) {
        if (error == null) {
            return null;
        }
        return error.length() > 500 ? error.substring(0, 500) : error;
    }

    private void ackMessage(StreamMessageId messageId) {
        try {
            redisService.streamAck(streamKey(), groupName(), messageId);
        } catch (Exception e) {
            log.error("确认消息失败: messageId={}, error={}", messageId, e.getMessage(), e);
        }
    }

    protected RedisService redisService() {
        return redisService;
    }

    protected abstract String taskDisplayName();

    protected abstract String streamKey();

    protected abstract String groupName();

    protected abstract String consumerPrefix();

    protected abstract String threadName();

    protected abstract T parsePayload(StreamMessageId messageId, Map<String, String> data);

    protected abstract String payloadIdentifier(T payload);

    protected abstract void markProcessing(T payload);

    protected abstract void processBusiness(T payload);

    protected abstract void markCompleted(T payload);

    protected abstract void markFailed(T payload, String error);

    protected abstract void retryMessage(T payload, int retryCount);
}
