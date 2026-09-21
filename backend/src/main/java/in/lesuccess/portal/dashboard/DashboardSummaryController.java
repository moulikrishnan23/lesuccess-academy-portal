package in.lesuccess.portal.dashboard;

import in.lesuccess.portal.companypartner.CompanyPartnerRepository;
import in.lesuccess.portal.connectwithus.ConnectWithUsRepository;
import in.lesuccess.portal.contact.ContactMessageRepository;
import in.lesuccess.portal.course.CourseRepository;
import in.lesuccess.portal.course.TestimonialRepository;
import in.lesuccess.portal.courseenquiry.CourseEnquiryRepository;
import in.lesuccess.portal.demobooking.DemoBookingRepository;
import in.lesuccess.portal.gallery.GalleryImageRepository;
import in.lesuccess.portal.lead.LeadRepository;
import in.lesuccess.portal.shared.dto.ApiResponse;
import in.lesuccess.portal.teammember.TeamMemberRepository;
import in.lesuccess.portal.upcomingprogram.UpcomingProgramRegistrationRepository;
import in.lesuccess.portal.upcomingprogram.UpcomingProgramRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashboardSummaryController {

    private final CourseRepository courseRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final GalleryImageRepository galleryImageRepository;
    private final DemoBookingRepository demoBookingRepository;
    private final ContactMessageRepository contactMessageRepository;
    private final LeadRepository leadRepository;
    private final CourseEnquiryRepository courseEnquiryRepository;
    private final ConnectWithUsRepository connectWithUsRepository;
    private final UpcomingProgramRepository upcomingProgramRepository;
    private final UpcomingProgramRegistrationRepository upcomingProgramRegistrationRepository;
    private final TestimonialRepository testimonialRepository;
    private final CompanyPartnerRepository companyPartnerRepository;

    @Data
    @Builder
    public static class DashboardSummaryResponse {
        private long totalCourses;
        private long totalTeamMembers;
        private long totalGalleryItems;
        private long totalDemoBookings;
        private long totalContactMessages;
        private long totalLeads;
        private long totalCourseEnquiries;
        private long totalConnectWithUs;
        private long totalUpcomingPrograms;
        private long totalProgramRegistrations;
        private long totalTestimonials;
        private long totalCompanyPartners;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSummary() {
        DashboardSummaryResponse summary = DashboardSummaryResponse.builder()
                .totalCourses(courseRepository.count())
                .totalTeamMembers(teamMemberRepository.count())
                .totalGalleryItems(galleryImageRepository.count())
                .totalDemoBookings(demoBookingRepository.count())
                .totalContactMessages(contactMessageRepository.count())
                .totalLeads(leadRepository.count())
                .totalCourseEnquiries(courseEnquiryRepository.count())
                .totalConnectWithUs(connectWithUsRepository.count())
                .totalUpcomingPrograms(upcomingProgramRepository.count())
                .totalProgramRegistrations(upcomingProgramRegistrationRepository.count())
                .totalTestimonials(testimonialRepository.countByDeletedAtIsNull())
                .totalCompanyPartners(companyPartnerRepository.count())
                .build();

        return ResponseEntity.ok(ApiResponse.success("Dashboard summary retrieved successfully", summary));
    }
}
