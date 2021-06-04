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

    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags;

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    if (actorData.type === 'character') this._prepareCharacterData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) 
  {
    const data = actorData.data;

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
      used += i.data.data.slots;
      //check if actor can use spell based on level
      if(i.type === "spell")
        i.data.data.spellUsable = (Number(actorData.data.level.value) >= Number(i.data.data.level));
    }
    data.inventorySlots.used = used;

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, ability] of Object.entries(data.abilities)) 
    {      
      ability.defense = Math.floor((ability.value + 10));      
    }
  }

}