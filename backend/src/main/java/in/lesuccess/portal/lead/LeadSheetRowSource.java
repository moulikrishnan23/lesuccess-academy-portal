package in.lesuccess.portal.lead;

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

/**
 * Leads' sheet layout, and how to rebuild a row for retry.
 *
 * <p>Its own tab, not the Contact Messages one: the two have different columns,
 * and mixing them would make either sheet unreadable for the people who work
 * these enquiries.</p>
 */
@Component
@RequiredArgsConstructor
public class LeadSheetRowSource implements SheetRowSource {

    private final LeadRepository repository;

    private static final DateTimeFormatter DT_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /** Columns A-I; status lives in I. */
    public static final SheetSpec SPEC = new SheetSpec(
            "Leads",
            List.of("ID", "Created At", "Name", "Mobile", "Email",
                    "Course ID", "Looking For", "Source", "Status"),
            "A",
            "I");

    @Override
    public SyncEntityType entityType() {
        return SyncEntityType.LEAD;
    }

    @Override
    public SheetSpec spec() {
        return SPEC;
    }

    @Override
    public Optional<SheetRow> buildRow(Long entityId) {
        return repository.findById(entityId).map(LeadSheetRowSource::toRow);
    }

    public static SheetRow toRow(Lead lead) {
        List<Object> values = Arrays.asList(
                lead.getId(),
                lead.getCreatedAt().format(DT_FORMAT),
                lead.getName(),
                lead.getMobile(),
                lead.getEmail() == null ? "" : lead.getEmail(),
                lead.getCourseId() == null ? "" : lead.getCourseId(),
                lead.getLookingFor() == null ? "" : lead.getLookingFor(),
                lead.getSource().name(),
                lead.getStatus().name()
        );

        return new SheetRow(SPEC, SyncEntityType.LEAD, lead.getId(), values);
    }
}
