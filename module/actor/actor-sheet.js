/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class KnaveActorSheet extends ActorSheet 
{

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["knave", "sheet", "actor"],
      template: "systems/knave/templates/actor/actor-sheet.html",
      width: 1000,
      height: 620,
      tabs: [{ navSelector: ".decstription-tabs", contentSelector: ".decstription-tabs-content", initial: "description" }]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  /*
  getData() 
  {
    const data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];
    for (let attr of Object.values(data.data.attributes))
    {
      attr.isCheckbox = attr.dtype === "Boolean";
    }
    return data;
  }
*/
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    //ability button clicked
    html.find('.knave-ability-button').click(ev => { this._onAbility_Clicked($(ev.currentTarget)[0].id); });
    html.find('.knave-morale-button').click(this._onMoraleCheck.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });

    //inventory weapon rolls
    html.find('.item-roll').click(ev => 
    {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));  
      this._onItemRoll(item, ev.currentTarget);
    });
  }

  /* -------------------------------------------- */

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return this.actor.createOwnedItem(itemData);
  }

  _onAbility_Clicked(ability)
  {
    let score = 0;
    let name = "";
    switch(ability)
    {
      case "str": score = this.actor.data.data.abilities.str.value; name="STR"; break;
      case "dex": score = this.actor.data.data.abilities.dex.value; name="DEX"; break;
      case "con": score = this.actor.data.data.abilities.con.value; name="CON"; break;
      case "int": score = this.actor.data.data.abilities.int.value; name="INT"; break;
      case "wis": score = this.actor.data.data.abilities.wis.value; name="WIS"; break;
      case "cha": score = this.actor.data.data.abilities.cha.value; name="CHA"; break;
    }    
  
    let formula = `1d20+${score}`;
    let r = new Roll(formula);    
    r.roll();
   
    let returnCode = 0;
    let messageHeader = "<b>" + name + "</b>";
    if(r.dice[0].total === 1)
    {
      messageHeader += ' - <span class="knave-ability-crit knave-ability-critFailure">CRITICAL FAILURE!</span>';
      returnCode = -1;
    }
    else if(r.dice[0].total === 20)
    {
      messageHeader += ' - <span class="knave-ability-crit knave-ability-critSuccess">CRITICAL SUCCESS!</span>';
      returnCode = 1;
    }
    
    r.toMessage({speaker: ChatMessage.getSpeaker({ actor: this.actor }), flavor: messageHeader});
    return returnCode;
  }

  _onMoraleCheck(event)
  {
    event.preventDefault();
    
    let r = new Roll(`2d6`);    
    r.roll();
   
    let messageHeader = "";
    if(r.dice[0].total > this.actor.data.data.morale.value)
      messageHeader += '<span class="knave-ability-crit knave-ability-critFailure">Is fleeing</span>';
    else
      messageHeader += '<span class="knave-ability-crit knave-ability-critSuccess">Is staying</span>';
    r.toMessage({ flavor: messageHeader});
  }

  _onItemRoll(item, eventTarget)
  {
    if(eventTarget.title === "attack")
    {
      if(item.type === "weaponMelee" && !this._itemIsBroken(item))
      {
        if(this._onAbility_Clicked("str") === -1)
          this._weaponCriticalFailure(item);        
      }
      else if(item.type === "weaponRanged" && !this._itemIsBroken(item))
          this._rangedAttackRoll(item);
    }
    else if(eventTarget.title === "damage" && !this._itemIsBroken(item))
    {      
      let r = new Roll(item.data.data.damageDice);    
      r.roll();            
      let messageHeader = "<b>" + item.name + "</b>";   
      r.toMessage({ speaker: ChatMessage.getSpeaker({ actor: this.actor }), flavor: messageHeader});
    }
  }

  _weaponCriticalFailure(item)
  {
      item.data.data.quality.value -= 1;
      if(item.data.data.quality.value <= item.data.data.quality.min)
      {        
        let content = '<span class="knave-ability-crit knave-ability-critFailure"><b>' + item.name + "</b> broke!</span>"; 
        ChatMessage.create({
          user: game.user._id,
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: content
        });
      }
      else
      {
        let content = '<span><b>' + item.name + "</b> quality reduced to " + item.data.data.quality.value + "/" + item.data.data.quality.max; + "</span>";
        ChatMessage.create({
          user: game.user._id,
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: content
        });
      }
  }

  _itemIsBroken(item)
  {
    if(item.data.data.quality.value <= 0)
    {
      let content = '<span class="knave-ability-crit knave-ability-critFailure"><b>' + item.name + "</b> is broken!</span>"; 
        ChatMessage.create({
          user: game.user._id,
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: content
        });
      return true;
    }

    return false;
  }

  _rangedAttackRoll(item)
  {
    if(item.data.data.ammo.value > 0)
    {
      if(this._onAbility_Clicked("wis") === -1)
        this._weaponCriticalFailure(item);

      item.data.data.ammo.value -= 1;   
      if(item.data.data.ammo.value <= 0)
        this._createNoAmmoMsg(item, true);
    }
    else
      this._createNoAmmoMsg(item, false);
  }

  _createNoAmmoMsg(item, outOfAmmo)
  {
      let content = "<b>" + item.name + "</b> ";   
      if(outOfAmmo === true)
      { content += "is out of ammo!"; }
      else
      { content += "has no ammo!"; }
      
        ChatMessage.create({
          user: game.user._id,
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: content
        });
  }
}
