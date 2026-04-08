package pe.edu.unmsm.fisi.techeng.portfolio.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.unmsm.fisi.techeng.portfolio.dto.PortfolioDtos;
import pe.edu.unmsm.fisi.techeng.portfolio.service.PortfolioService;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PortfolioControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PortfolioService portfolioService;

    @Test
    void shouldExposePortfolioEndpoints() throws Exception {
        when(portfolioService.getCurrentPortfolio(7L)).thenReturn(new PortfolioDtos.PortfolioResponse(
                7L,
                6,
                2,
                0.5,
                18,
                4,
                3,
                1,
                72.5,
                0.44,
                0.2,
                List.of(),
                List.of(),
                Instant.now()
        ));
        when(portfolioService.getTimeline(7L)).thenReturn(new PortfolioDtos.PortfolioTimelineResponse(
                7L,
                List.of(new PortfolioDtos.PortfolioTimelineEntry("TASK", Instant.now(), "Task", 80, "Snippet"))
        ));
        when(portfolioService.getHistory(7L, 8)).thenReturn(List.of(
                new PortfolioDtos.PortfolioSnapshotResponse(1L, 7L, "ON_DEMAND", 6, 2, 0.5, 18, 4, 3, 1, 72.5, 0.44, 0.2, Instant.now())
        ));
        when(portfolioService.recomputeAll()).thenReturn(List.of(
                new PortfolioDtos.PortfolioSnapshotResponse(1L, 7L, "WEEKLY", 6, 2, 0.5, 18, 4, 3, 1, 72.5, 0.44, 0.2, Instant.now())
        ));
        when(portfolioService.recomputeOne(7L)).thenReturn(new PortfolioDtos.PortfolioResponse(
                7L,
                6,
                2,
                0.5,
                18,
                4,
                3,
                1,
                72.5,
                0.44,
                0.2,
                List.of(),
                List.of(),
                Instant.now()
        ));

        mockMvc.perform(get("/api/v1/portfolio/users/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.userId").value(7))
                .andExpect(jsonPath("$.data.tasksCompleted").value(6));

        mockMvc.perform(get("/api/v1/portfolio/users/7/timeline"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.entries.length()").value(1));

        mockMvc.perform(get("/api/v1/portfolio/users/7/history").param("weeks", "8"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));

        mockMvc.perform(post("/api/v1/portfolio/recompute"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));

        mockMvc.perform(post("/api/v1/portfolio/users/7/recompute"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.vocabularySize").value(18));
    }
}
