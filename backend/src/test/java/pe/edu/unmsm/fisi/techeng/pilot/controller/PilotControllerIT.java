package pe.edu.unmsm.fisi.techeng.pilot.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.unmsm.fisi.techeng.pilot.dto.PilotDtos;
import pe.edu.unmsm.fisi.techeng.pilot.service.PilotCohortService;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PilotControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PilotCohortService pilotCohortService;

    @Test
    void shouldExposePilotEndpoints() throws Exception {
        PilotDtos.PilotCohortResponse cohort = new PilotDtos.PilotCohortResponse(
                5L, "Grupo A", "Piloto", "ENROLLING", 10, 1, Instant.now(), null, null, null, 1L
        );
        when(pilotCohortService.create(new PilotDtos.CreateCohortRequest("Grupo A", "Piloto", 10, 1L))).thenReturn(cohort);
        when(pilotCohortService.list()).thenReturn(List.of(cohort));
        when(pilotCohortService.getById(5L)).thenReturn(cohort);
        when(pilotCohortService.advancePhase(5L, pe.edu.unmsm.fisi.techeng.pilot.entity.CohortState.PRE_TEST_PHASE)).thenReturn(
                new PilotDtos.PilotCohortResponse(5L, "Grupo A", "Piloto", "PRE_TEST_PHASE", 10, 1, Instant.now(), null, null, null, 1L)
        );
        when(pilotCohortService.triggerPostTest(5L)).thenReturn(
                new PilotDtos.PilotCohortResponse(5L, "Grupo A", "Piloto", "POST_TEST_PHASE", 10, 1, Instant.now(), null, Instant.now(), null, 1L)
        );
        when(pilotCohortService.getEnrollments(5L)).thenReturn(List.of(
                new PilotDtos.PilotEnrollmentResponse(8L, 5L, 7L, Instant.now(), 3L, List.of(1L), null, List.of(), null, null, 0)
        ));
        when(pilotCohortService.computeResults(5L)).thenReturn(
                new PilotDtos.PilotResultsResponse(
                        5L,
                        "Grupo A",
                        1,
                        1,
                        new PilotDtos.PilotMetricEntry(2.0, 0.6, 10.0, 0.8, 0.7, 30.0, 0.5, 1.0),
                        List.of()
                )
        );

        mockMvc.perform(get("/api/v1/pilot/cohorts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));

        mockMvc.perform(get("/api/v1/pilot/cohorts/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Grupo A"));

        mockMvc.perform(patch("/api/v1/pilot/cohorts/5/advance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"state\":\"PRE_TEST_PHASE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.state").value("PRE_TEST_PHASE"));

        mockMvc.perform(post("/api/v1/pilot/cohorts/5/trigger-post-test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.state").value("POST_TEST_PHASE"));

        mockMvc.perform(get("/api/v1/pilot/cohorts/5/enrollments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));

        mockMvc.perform(get("/api/v1/pilot/cohorts/5/results"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.metrics.vocabularySizeDelta").value(2.0));
    }
}
