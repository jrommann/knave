/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class KnaveItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    // Get the Item's data
    //const itemData = this.data;
    const actorData = this.actor ? this.actor : {};
    const data = this.system;

    if(this.type === "weaponRanged")
    {
      if(data.ammo.value > data.ammo.max)
        data.ammo.value = data.ammo.max;
      else if(data.ammo.value < data.ammo.min)
        data.ammo.value = data.ammo.min;
    }
  }
}
