package pe.edu.unmsm.fisi.techeng.review.entity;

public enum ReviewGrade {
    AGAIN(1),
    HARD(2),
    GOOD(3),
    EASY(4);

    private final int value;

    ReviewGrade(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}
