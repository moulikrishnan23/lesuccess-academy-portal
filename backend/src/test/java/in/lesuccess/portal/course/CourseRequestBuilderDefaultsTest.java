package in.lesuccess.portal.course;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Pins the defaults these three request types promise, whichever way they are
 * built - the builder (tests, internal callers) or the no-args constructor plus
 * setters (the path Jackson takes when deserializing a request body).
 *
 * <p>What this does NOT test is the {@code @Builder.Default} annotations added
 * alongside it. Lombok ignores a field initializer on a {@code @Builder} class
 * without that annotation, so the builder used to leave {@code displayOrder}
 * null - but nothing observable followed from it, because the hand-written
 * {@code getDisplayOrder()} accessors coerce null to 0 and Lombok routes the
 * generated equals, hashCode and toString through those accessors rather than
 * reading the fields. The annotations are tidiness, not a bug fix.</p>
 *
 * <p>What these tests do guard is the contract callers actually depend on:
 * {@code CourseService#create} branches on {@code request.getDisplayOrder() > 0}
 * to decide whether to honour a requested position or append to the end, and
 * unboxes the result. Remove the null coercion from an accessor and drop its
 * {@code @Builder.Default} and that branch throws; these fail first.</p>
 */
class CourseRequestBuilderDefaultsTest {

    @Test
    @DisplayName("CourseRequest defaults to order 0 and active, however it is built")
    void courseRequestDefaults() {
        CourseRequest built = CourseRequest.builder().name("Embedded Systems with Rust").build();

        CourseRequest deserialized = new CourseRequest();
        deserialized.setName("Embedded Systems with Rust");

        assertThat(built.getDisplayOrder())
                .as("0 is what CourseService#create reads as 'no position requested'")
                .isEqualTo(0);
        assertThat(deserialized.getDisplayOrder()).isEqualTo(0);

        assertThat(built.isActive())
                .as("a course omitting isActive is published, not hidden")
                .isTrue();
        assertThat(deserialized.isActive()).isTrue();
    }

    @Test
    @DisplayName("CourseToolRequest defaults to order 0, however it is built")
    void courseToolRequestDefaults() {
        CourseToolRequest deserialized = new CourseToolRequest();
        deserialized.setToolName("Rust");

        assertThat(CourseToolRequest.builder().toolName("Rust").build().getDisplayOrder()).isEqualTo(0);
        assertThat(deserialized.getDisplayOrder()).isEqualTo(0);
    }

    @Test
    @DisplayName("CourseModuleRequest defaults to order 0, however it is built")
    void courseModuleRequestDefaults() {
        CourseModuleRequest deserialized = new CourseModuleRequest();
        deserialized.setTitle("Board bring-up");

        assertThat(CourseModuleRequest.builder().title("Board bring-up").build().getDisplayOrder()).isEqualTo(0);
        assertThat(deserialized.getDisplayOrder()).isEqualTo(0);
    }

    /**
     * A request that omits displayOrder must be appended, not inserted at the
     * front. This is the branch the coercion above feeds, stated directly so the
     * reason those defaults matter is visible from the test that guards them.
     */
    @Test
    @DisplayName("omitting displayOrder means 'append', not 'position 0'")
    void omittedOrderMeansAppend() {
        CourseRequest request = CourseRequest.builder().name("Embedded Systems with Rust").build();

        assertThat(request.getDisplayOrder() > 0)
                .as("CourseService#create falls through to nextOrder when this is false")
                .isFalse();
    }
}
