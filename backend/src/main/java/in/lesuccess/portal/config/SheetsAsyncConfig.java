package in.lesuccess.portal.config;

import in.lesuccess.portal.shared.sheets.SheetsRejectedExecutionHandler;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Dedicated, bounded executor for Google Sheets synchronisation.
 * <p>
 * The application runs with {@code spring.threads.virtual.enabled: true}, which
 * makes Boot's auto-configured {@code applicationTaskExecutor} a
 * {@code SimpleAsyncTaskExecutor} on virtual threads — unbounded by design, with
 * neither a pool ceiling nor a queue cap. That is the right default for request
 * handling, but the wrong one for Sheets sync: each task performs retry backoff
 * plus network I/O against a rate-limited third-party API, so an unbounded fan-out
 * would let a submission spike hammer the Sheets quota without any ceiling.
 * <p>
 * Sheets writes are submitted to this pool through
 * {@code SheetsSyncDispatcher} rather than via {@code @Async}, so that a task
 * rejected at queue saturation still carries the identity of the entity it was
 * going to write — see {@link SheetsRejectedExecutionHandler}.
 */
@Configuration
public class SheetsAsyncConfig {

    @Bean(name = "sheetsSyncExecutor")
    public Executor sheetsSyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("sheets-sync-");
        // Without an explicit handler this defaults to AbortPolicy: at saturation the
        // submission throws, the exception is swallowed by the caller, and the write is
        // lost with no sync_failure row to retry from. Record it instead. The handler is
        // stateless — it records through the rejected task's own SyncFailureRecorder.
        executor.setRejectedExecutionHandler(new SheetsRejectedExecutionHandler());
        // Let in-flight Sheets calls finish on shutdown rather than losing a write.
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();
        return executor;
    }
}
