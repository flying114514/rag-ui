package interview.guide.common.monitoring;

import interview.guide.common.constant.AsyncTaskStreamConstants;
import interview.guide.infrastructure.redis.RedisService;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

/**
 * 异步任务关键指标注册
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AsyncStreamMetricsRegistrar {

    private final MeterRegistry meterRegistry;
    private final RedisService redisService;

    @PostConstruct
    public void registerGauges() {
        registerStreamLengthGauge("vectorize", AsyncTaskStreamConstants.KB_VECTORIZE_STREAM_KEY);
        registerStreamLengthGauge("analyze", AsyncTaskStreamConstants.RESUME_ANALYZE_STREAM_KEY);
        registerStreamLengthGauge("evaluate", AsyncTaskStreamConstants.INTERVIEW_EVALUATE_STREAM_KEY);
        log.info("异步 Stream 监控指标注册完成");
    }

    private void registerStreamLengthGauge(String streamType, String streamKey) {
        Gauge.builder("app.async.stream.length", redisService, svc -> safeStreamLen(streamKey, svc))
            .description("Redis Stream 当前长度")
            .tag("stream", streamType)
            .tag("streamKey", streamKey)
            .register(meterRegistry);
    }

    private double safeStreamLen(String streamKey, RedisService svc) {
        try {
            return svc.streamLen(streamKey);
        } catch (Exception e) {
            log.debug("读取 Stream 长度失败: streamKey={}, error={}", streamKey, e.getMessage());
            return -1D;
        }
    }
}
