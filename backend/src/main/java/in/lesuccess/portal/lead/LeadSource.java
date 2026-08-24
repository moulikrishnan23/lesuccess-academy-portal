package in.lesuccess.portal.lead;

/**
 * Which form produced a lead.
 *
 * <p>All four values exist in the schema from the start so later forms need no
 * migration, but only some are currently accepted over HTTP — see
 * {@code lesuccess.leads.accepted-sources} and {@link LeadService}.</p>
 */
public enum LeadSource {
    HOME_DEMO_FORM,
    HOME_CONNECT_FORM,
    SERVICE_CTA_FORM,
    COURSE_ENROLL_FORM
}
