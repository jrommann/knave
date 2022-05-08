/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class KnaveActor extends Actor {

  /**
   * Augment the basic actor data with additional dynamic data.
   */
  prepareData() {
    super.prepareData();
    
    const data = this.system;
    const flags = this.flags;

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    if (this.type === 'character') this._prepareCharacterData(this);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) 
  {
    const data = actorData.system;

    //calculate armor bonus
    data.armor.bonus = Number(data.armor.value) - Number(10);

    //clamp health
    if(data.health.value > data.health.max)
      data.health.value = data.health.max;
    
    data.inventorySlots.value = Number(data.abilities.con.value) + Number(10);
    let used = 0;
    for(let i of actorData.items)
    {
      //calculate max inventory slots and used slots
      used += i.system.slots;
      //check if actor can use spell based on level
      if(i.type === "spell")
        i.system.spellUsable = (Number(actorData.system.level.value) >= Number(i.system.level));
    }
    data.inventorySlots.used = used;

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, ability] of Object.entries(data.abilities)) 
    {      
      ability.defense = Math.floor((ability.value + 10));      
    }
  }

}