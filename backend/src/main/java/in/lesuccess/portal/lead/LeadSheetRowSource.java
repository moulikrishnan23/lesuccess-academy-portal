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

    /**
     * Columns A-I; status lives in I.
     *
     * <p>Mobile (D) used to be hidden on the grounds that it is optional on the
     * capture form since V20 and therefore mostly blank. It is shown now: the
     * number is the only way to call back a lead who left one, so the times it is
     * filled in matter far more than the clutter on the times it is not.</p>
     *
     * <p>No tab hides columns any more, but the {@code hiddenColumns} argument
     * stays on {@link SheetSpec} for the next layout that needs it.</p>
     */
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
                // Mobile is optional since V20. A raw null is dropped during JSON
                // serialisation rather than written as a blank cell, which shifts
                // every following value one column left — so coerce it like the rest.
                lead.getMobile() == null ? "" : lead.getMobile(),
                lead.getEmail() == null ? "" : lead.getEmail(),
                lead.getCourseId() == null ? "" : lead.getCourseId(),
                lead.getLookingFor() == null ? "" : lead.getLookingFor(),
                lead.getSource().name(),
                lead.getStatus().name()
        );

        return new SheetRow(SPEC, SyncEntityType.LEAD, lead.getId(), values);
    }
}
