package in.lesuccess.portal.contact;

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

/** Contact messages' sheet layout, and how to rebuild a row for retry. */
@Component
@RequiredArgsConstructor
public class ContactMessageSheetRowSource implements SheetRowSource {

    private final ContactMessageRepository repository;

    private static final DateTimeFormatter DT_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /** Columns A-J; status lives in J, which is what a status update rewrites. */
    public static final SheetSpec SPEC = new SheetSpec(
            "Contact Messages",
            List.of("ID", "Created At", "Name", "Email", "Phone",
                    "Who You Are", "Looking For", "Location", "Message", "Status"),
            "A",
            "J");

    @Override
    public SyncEntityType entityType() {
        return SyncEntityType.CONTACT_MESSAGE;
    }

    @Override
    public SheetSpec spec() {
        return SPEC;
    }

    @Override
    public Optional<SheetRow> buildRow(Long entityId) {
        return repository.findById(entityId).map(ContactMessageSheetRowSource::toRow);
    }

    public static SheetRow toRow(ContactMessage message) {
        List<Object> values = Arrays.asList(
                message.getId(),
                message.getCreatedAt().format(DT_FORMAT),
                message.getName(),
                message.getEmail(),
                message.getPhone(),
                message.getWhoYouAre(),
                message.getLookingFor(),
                message.getLocation(),
                message.getMessage(),
                message.getStatus().name()
        );

        return new SheetRow(SPEC, SyncEntityType.CONTACT_MESSAGE, message.getId(), values);
    }
}
