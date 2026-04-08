package pe.edu.unmsm.fisi.techeng.kc.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import pe.edu.unmsm.fisi.techeng.shared.entity.BaseEntity;

@Entity
@Table(
        name = "item_kc_mappings",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_item_kc_mapping_item_type_id_kc",
                        columnNames = {"itemType", "itemId", "kcId"}
                )
        },
        indexes = {
                @Index(name = "idx_item_kc_mapping_item", columnList = "itemType,itemId"),
                @Index(name = "idx_item_kc_mapping_kc", columnList = "kcId")
        }
)
public class ItemKcMapping extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private KcItemType itemType;

    @Column(nullable = false)
    private Long itemId;

    @Column(nullable = false)
    private Long kcId;

    @Column(nullable = false)
    private double weight = 1.0;

    public KcItemType getItemType() {
        return itemType;
    }

    public void setItemType(KcItemType itemType) {
        this.itemType = itemType;
    }

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public Long getKcId() {
        return kcId;
    }

    public void setKcId(Long kcId) {
        this.kcId = kcId;
    }

    public double getWeight() {
        return weight;
    }

    public void setWeight(double weight) {
        this.weight = weight;
    }
}
