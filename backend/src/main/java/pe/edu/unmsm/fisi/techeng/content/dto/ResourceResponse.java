package pe.edu.unmsm.fisi.techeng.content.dto;

import pe.edu.unmsm.fisi.techeng.content.entity.ResourceType;

public record ResourceResponse(
        Long id,
        String title,
        String url,
        ResourceType type,
        String description
) {}
