package pe.edu.unmsm.fisi.techeng.task.entity;

/**
 * Task types derived from observed real-world activities of software engineers per Long (2015)
 * task-based needs analysis. Each type is a recurring engineering communication genre.
 */
public enum TaskType {
    ERROR_MESSAGE("Mensaje de error"),
    API_DOC("Documentacion de API"),
    COMMIT_MSG("Mensaje de commit"),
    PR_DESC("Descripcion de PR"),
    CODE_REVIEW("Revision de codigo"),
    TECH_REPORT("Reporte tecnico");

    private final String displayNameEs;

    TaskType(String displayNameEs) {
        this.displayNameEs = displayNameEs;
    }

    public String getDisplayNameEs() {
        return displayNameEs;
    }
}
