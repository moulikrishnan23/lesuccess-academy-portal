package in.lesuccess.portal.course;

import in.lesuccess.portal.shared.dto.PageResponse;
import in.lesuccess.portal.shared.exception.ResourceNotFoundException;
import in.lesuccess.portal.shared.util.OrderRebalanceUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository repository;
    private final CourseModuleRepository moduleRepository;
    private final CourseToolRepository toolRepository;
    private final TestimonialRepository testimonialRepository;

    @Transactional(readOnly = true)
    /**
     * The public catalog.
     *
     * <p>Carries each course's tools, which it did not before: {@code from(entity)}
     * passes null for them, so every card on /courses had a null tech stack and the
     * frontend fell back to guessing a stack from keywords in the course title. A
     * course added through the admin panel matched none of those keywords and got
     * a generic list, which is the opposite of the dashboard being the source of
     * truth. Modules stay out - a card needs the stack, not the syllabus.</p>
     */
    public List<CourseResponse> listActive() {
        List<Course> courses = repository.findByIsActiveTrueOrderByDisplayOrderAsc();
        if (courses.isEmpty()) {
            return List.of();
        }

        Map<Long, List<CourseToolResponse>> toolsByCourseId = listToolsFor(
                courses.stream().map(Course::getId).toList());

        return courses.stream()
                .map(course -> CourseResponse.from(
                        course, null, toolsByCourseId.getOrDefault(course.getId(), List.of())))
                .toList();
    }

    /**
     * Tools for many courses at once, keyed by course id.
     *
     * <p>Reads the id off the lazy {@code course} association rather than fetch
     * joining it: Hibernate answers getId() from the proxy's identifier without
     * initialising it, so this stays one query.</p>
     */
    private Map<Long, List<CourseToolResponse>> listToolsFor(List<Long> courseIds) {
        return toolRepository.findByCourseIdInOrderByCourseIdAscDisplayOrderAsc(courseIds)
                .stream()
                .collect(Collectors.groupingBy(
                        tool -> tool.getCourse().getId(),
                        Collectors.mapping(CourseToolResponse::from, Collectors.toList())));
    }

    @Transactional(readOnly = true)
    public CourseResponse getById(Long id) {
        Course course = findOrThrow(id);
        List<CourseModuleResponse> modules = listModules(course.getId());
        List<CourseToolResponse> tools = listTools(course.getId());
        return CourseResponse.from(course, modules, tools);
    }

    @Transactional(readOnly = true)
    public CourseResponse getByIdOrSlug(String idOrSlug) {
        Course course = findByIdOrSlug(idOrSlug);
        List<CourseModuleResponse> modules = listModules(course.getId());
        List<CourseToolResponse> tools = listTools(course.getId());
        return CourseResponse.from(course, modules, tools);
    }

    public Course findByIdOrSlug(String idOrSlug) {
        if (idOrSlug == null || idOrSlug.isBlank()) {
            throw new ResourceNotFoundException("Course not found: " + idOrSlug);
        }
        try {
            Long id = Long.parseLong(idOrSlug.trim());
            return repository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Course", id));
        } catch (NumberFormatException ignored) {
            // Not a numeric ID, search by slug or name
        }

        String targetSlug = idOrSlug.trim().toLowerCase();
        return repository.findAll().stream()
                .filter(c -> CourseResponse.toSlug(c.getName()).equalsIgnoreCase(targetSlug)
                        || c.getName().equalsIgnoreCase(idOrSlug.trim()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + idOrSlug));
    }

    @Transactional(readOnly = true)
    public PageResponse<CourseResponse> listAllForAdmin(Pageable pageable) {
        return PageResponse.from(repository.findAllForAdmin(pageable).map(CourseResponse::from));
    }

    @Transactional
    public CourseResponse create(CourseRequest request) {
        List<Course> allCourses = repository.findAllByOrderByDisplayOrderAscIdAsc();
        int nextOrder = OrderRebalanceUtil.getNextOrder(allCourses, Course::getDisplayOrder);
        int assignedOrder = request.getDisplayOrder() > 0 ? request.getDisplayOrder() : nextOrder;

        Course entity = Course.builder()
                .name(request.getName().trim())
                .shortDescription(request.getShortDescription())
                .durationMonths(request.getDurationMonths())
                .mode(request.getMode())
                .badge(request.getBadge())
                .badgeText(request.getBadgeText())
                .placementAssistance(request.isPlacementAssistance())
                .syllabusUrl(request.getSyllabusUrl())
                .enrollUrl(request.getEnrollUrl())
                .iconUrl(request.getIconUrl())
                .description(request.getDescription())
                .category(request.getCategory())
                .roleHeading(request.getRoleHeading())
                .roleIntro(request.getRoleIntro())
                .roleBullets(request.resolveRoleBullets())
                .isActive(request.isActive())
                .displayOrder(assignedOrder)
                .build();

        Course saved = repository.save(entity);

        if (assignedOrder <= allCourses.size()) {
            allCourses.add(saved);
            List<Course> modified = OrderRebalanceUtil.reorder(
                    allCourses, saved.getId(), assignedOrder,
                    Course::getId, Course::getDisplayOrder, Course::setDisplayOrder);
            if (!modified.isEmpty()) {
                repository.saveAll(modified);
            }
        }

        log.info("Course created: id={}, name={}, order={}", saved.getId(), saved.getName(), saved.getDisplayOrder());

        if (request.getTools() != null) {
            syncTools(saved.getId(), request.getTools());
        }
        if (request.getModules() != null) {
            syncModules(saved.getId(), request.getModules());
        }

        return CourseResponse.from(saved, listModules(saved.getId()), listTools(saved.getId()));
    }

    @Transactional
    public CourseResponse update(Long id, CourseRequest request) {
        Course entity = findOrThrow(id);
        int oldOrder = entity.getDisplayOrder();
        int newOrder = request.getDisplayOrder() > 0 ? request.getDisplayOrder() : oldOrder;

        entity.setName(request.getName().trim());
        entity.setShortDescription(request.getShortDescription());
        entity.setDurationMonths(request.getDurationMonths());
        entity.setMode(request.getMode());
        entity.setBadge(request.getBadge());
        entity.setBadgeText(request.getBadgeText());
        entity.setPlacementAssistance(request.isPlacementAssistance());
        entity.setSyllabusUrl(request.getSyllabusUrl());
        entity.setEnrollUrl(request.getEnrollUrl());
        entity.setIconUrl(request.getIconUrl());
        entity.setDescription(request.getDescription());
        entity.setCategory(request.getCategory());
        entity.setRoleHeading(request.getRoleHeading());
        entity.setRoleIntro(request.getRoleIntro());
        entity.setRoleBullets(request.resolveRoleBullets());
        entity.setActive(request.isActive());

        if (oldOrder != newOrder) {
            List<Course> allCourses = repository.findAllByOrderByDisplayOrderAscIdAsc();
            List<Course> modified = OrderRebalanceUtil.reorder(
                    allCourses, id, newOrder,
                    Course::getId, Course::getDisplayOrder, Course::setDisplayOrder);
            if (!modified.isEmpty()) {
                repository.saveAll(modified);
            }
        } else {
            repository.saveAndFlush(entity);
        }

        Course refreshed = findOrThrow(id);
        log.info("Course updated: id={}, order={}", id, refreshed.getDisplayOrder());

        if (request.getTools() != null) {
            syncTools(refreshed.getId(), request.getTools());
        }
        if (request.getModules() != null) {
            syncModules(refreshed.getId(), request.getModules());
        }

        return CourseResponse.from(refreshed, listModules(refreshed.getId()), listTools(refreshed.getId()));
    }

    @Transactional
    public CourseResponse updateOrder(Long id, CourseOrderRequest request) {
        findOrThrow(id);
        List<Course> allCourses = repository.findAllByOrderByDisplayOrderAscIdAsc();
        List<Course> modified = OrderRebalanceUtil.reorder(
                allCourses, id, request.getDisplayOrder(),
                Course::getId, Course::getDisplayOrder, Course::setDisplayOrder);

        if (!modified.isEmpty()) {
            repository.saveAll(modified);
        }

        Course refreshed = findOrThrow(id);
        log.info("Course display order updated: id={}, order={}", id, refreshed.getDisplayOrder());
        return CourseResponse.from(refreshed);
    }

    @Transactional
    public void softDelete(Long id) {
        Course entity = findOrThrow(id);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setActive(false);
        repository.save(entity);

        List<Course> remaining = repository.findAllByOrderByDisplayOrderAscIdAsc();
        List<Course> modified = OrderRebalanceUtil.rebalance(
                remaining, Course::getDisplayOrder, Course::setDisplayOrder);
        if (!modified.isEmpty()) {
            repository.saveAll(modified);
        }

        log.info("Course soft-deleted: id={}", id);
    }

    public Course findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", id));
    }

    // ── Modules ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CourseModuleResponse> listModules(Long courseId) {
        return moduleRepository.findByCourseIdOrderByDisplayOrderAsc(courseId)
                .stream()
                .map(CourseModuleResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CourseModuleResponse> listModules(String idOrSlug) {
        Course course = findByIdOrSlug(idOrSlug);
        return listModules(course.getId());
    }

    @Transactional
    public CourseModuleResponse createModule(Long courseId, CourseModuleRequest request) {
        Course course = findOrThrow(courseId);
        CourseModule entity = CourseModule.builder()
                .course(course)
                .title(request.getTitle().trim())
                .content(request.getContent())
                .displayOrder(request.getDisplayOrder())
                .build();
        CourseModule saved = moduleRepository.save(entity);
        log.info("Course module created: id={}, courseId={}", saved.getId(), courseId);
        return CourseModuleResponse.from(saved);
    }

    @Transactional
    public CourseModuleResponse updateModule(Long moduleId, CourseModuleRequest request) {
        CourseModule entity = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Course module", moduleId));
        entity.setTitle(request.getTitle().trim());
        entity.setContent(request.getContent());
        entity.setDisplayOrder(request.getDisplayOrder());
        CourseModule saved = moduleRepository.saveAndFlush(entity);
        log.info("Course module updated: id={}", moduleId);
        return CourseModuleResponse.from(saved);
    }

    @Transactional
    public void deleteModule(Long moduleId) {
        if (!moduleRepository.existsById(moduleId)) {
            throw new ResourceNotFoundException("Course module", moduleId);
        }
        moduleRepository.deleteById(moduleId);
        log.info("Course module deleted: id={}", moduleId);
    }

    @Transactional
    public List<CourseModuleResponse> syncModules(Long courseId, List<CourseModuleRequest> moduleRequests) {
        Course course = findOrThrow(courseId);
        moduleRepository.deleteByCourseId(courseId);
        if (moduleRequests == null || moduleRequests.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        int order = 1;
        for (CourseModuleRequest req : moduleRequests) {
            if (req.getTitle() == null || req.getTitle().isBlank()) continue;
            CourseModule module = CourseModule.builder()
                    .course(course)
                    .title(req.getTitle().trim())
                    .content(req.resolveContent())
                    .displayOrder(req.getDisplayOrder() > 0 ? req.getDisplayOrder() : order++)
                    .build();
            moduleRepository.save(module);
        }
        return listModules(courseId);
    }

    // ── Tools ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CourseToolResponse> listTools(Long courseId) {
        return toolRepository.findByCourseIdOrderByDisplayOrderAsc(courseId)
                .stream()
                .map(CourseToolResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CourseToolResponse> listTools(String idOrSlug) {
        Course course = findByIdOrSlug(idOrSlug);
        return listTools(course.getId());
    }

    @Transactional
    public CourseToolResponse createTool(Long courseId, CourseToolRequest request) {
        Course course = findOrThrow(courseId);
        CourseTool entity = CourseTool.builder()
                .course(course)
                .groupName(request.getGroupName() != null && !request.getGroupName().isBlank() ? request.getGroupName().trim() : "Tools")
                .toolName(request.getToolName().trim())
                .iconUrl(request.getIconUrl() != null && !request.getIconUrl().isBlank() ? request.getIconUrl().trim() : null)
                .displayOrder(request.getDisplayOrder())
                .build();
        CourseTool saved = toolRepository.save(entity);
        log.info("Course tool created: id={}, courseId={}", saved.getId(), courseId);
        return CourseToolResponse.from(saved);
    }

    @Transactional
    public CourseToolResponse updateTool(Long toolId, CourseToolRequest request) {
        CourseTool entity = toolRepository.findById(toolId)
                .orElseThrow(() -> new ResourceNotFoundException("Course tool", toolId));
        if (request.getGroupName() != null && !request.getGroupName().isBlank()) {
            entity.setGroupName(request.getGroupName().trim());
        }
        entity.setToolName(request.getToolName().trim());
        entity.setIconUrl(request.getIconUrl() != null && !request.getIconUrl().isBlank() ? request.getIconUrl().trim() : null);
        entity.setDisplayOrder(request.getDisplayOrder());
        CourseTool saved = toolRepository.saveAndFlush(entity);
        log.info("Course tool updated: id={}", toolId);
        return CourseToolResponse.from(saved);
    }

    @Transactional
    public void deleteTool(Long toolId) {
        if (!toolRepository.existsById(toolId)) {
            throw new ResourceNotFoundException("Course tool", toolId);
        }
        toolRepository.deleteById(toolId);
        log.info("Course tool deleted: id={}", toolId);
    }

    @Transactional
    public List<CourseToolResponse> syncTools(Long courseId, List<CourseToolRequest> toolRequests) {
        Course course = findOrThrow(courseId);
        toolRepository.deleteByCourseId(courseId);
        if (toolRequests == null || toolRequests.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        int order = 1;
        for (CourseToolRequest req : toolRequests) {
            if (req.getToolName() == null || req.getToolName().isBlank()) continue;
            CourseTool tool = CourseTool.builder()
                    .course(course)
                    .groupName(req.getGroupName() != null && !req.getGroupName().isBlank() ? req.getGroupName().trim() : "Tools")
                    .toolName(req.getToolName().trim())
                    .iconUrl(req.getIconUrl() != null && !req.getIconUrl().isBlank() ? req.getIconUrl().trim() : null)
                    .displayOrder(req.getDisplayOrder() > 0 ? req.getDisplayOrder() : order++)
                    .build();
            toolRepository.save(tool);
        }
        return listTools(courseId);
    }

    // ── Testimonials ─────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TestimonialResponse> listTestimonials(Long courseId) {
        findOrThrow(courseId);
        List<TestimonialResponse> forCourse = testimonialRepository.findByCourseIdAndIsActiveTrueOrderByDisplayOrderAsc(courseId)
                .stream().map(TestimonialResponse::from).toList();
        if (forCourse.isEmpty()) {
            return testimonialRepository.findAllByIsActiveTrueOrderByDisplayOrderAscIdAsc()
                    .stream().map(TestimonialResponse::from).toList();
        }
        return forCourse;
    }

    @Transactional(readOnly = true)
    public List<TestimonialResponse> listTestimonials(String idOrSlug) {
        Course course = findByIdOrSlug(idOrSlug);
        return listTestimonials(course.getId());
    }

    @Transactional
    public TestimonialResponse createTestimonial(Long courseId, TestimonialRequest request) {
        Course course = findOrThrow(courseId);
        Testimonial entity = Testimonial.builder()
                .course(course)
                .studentName(request.getStudentName().trim())
                .reviewText(request.getReviewText().trim())
                .rating(request.getRating())
                .photoUrl(request.getPhotoUrl())
                .displayOrder(request.getDisplayOrder())
                .isActive(request.isActive())
                .build();
        Testimonial saved = testimonialRepository.save(entity);
        log.info("Testimonial created: id={}, courseId={}", saved.getId(), courseId);
        return TestimonialResponse.from(saved);
    }

    /*
     * updateTestimonial / deleteTestimonial used to live here, behind
     * PUT and DELETE /api/admin/testimonials/{id} on CourseController. Those two
     * mappings collided with TestimonialController's and made the endpoint return
     * 500 for every request; TestimonialService now owns both operations, since it
     * handles the fields and the order rebalancing this pair silently skipped.
     * See the note at the bottom of CourseController.
     */
}
