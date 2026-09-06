package in.lesuccess.portal.demobooking;

import in.lesuccess.portal.shared.sheets.SheetRow;
import in.lesuccess.portal.shared.sheets.SheetRowSource;
import in.lesuccess.portal.shared.sheets.SheetSpec;
import in.lesuccess.portal.shared.sheets.SyncEntityType;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

/** Demo bookings' sheet layout and how to rebuild a row for retry. */
@Component
@RequiredArgsConstructor
public class DemoBookingSheetRowSource implements SheetRowSource {

    private final DemoBookingRepository repository;

    private static final DateTimeFormatter DT_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /** Columns A-E; status lives in E. */
    public static final SheetSpec SPEC = new SheetSpec(
            "Demo Bookings",
            List.of("ID", "Created At", "Course Name", "Mobile Number", "Status"),
            "A",
            "E");

    @Override
    public SyncEntityType entityType() {
        return SyncEntityType.DEMO_BOOKING;
    }

    @Override
    public SheetSpec spec() {
        return SPEC;
    }

    @Override
    public Optional<SheetRow> buildRow(Long entityId) {
        return repository.findById(entityId).map(DemoBookingSheetRowSource::toRow);
    }

    public static SheetRow toRow(DemoBooking booking) {
        List<Object> values = Arrays.asList(
                booking.getId(),
                booking.getCreatedAt() != null ? booking.getCreatedAt().format(DT_FORMAT) : "",
                booking.getCourseName() != null ? booking.getCourseName() : "",
                booking.getMobileNumber() != null ? booking.getMobileNumber() : "",
                booking.getStatus() != null ? booking.getStatus().name() : "PENDING"
        );
        return new SheetRow(SPEC, SyncEntityType.DEMO_BOOKING, booking.getId(), values);
    }
}
