/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class KnaveActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["knave", "sheet", "actor"],
      template: "systems/knave/templates/actor/actor-sheet.html",
      width: 1000,
      height: 500,
      /*tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]*/
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
  
    let messageContent = '';
    let messageHeader = "<b>" + name + "</b><br>";
    let chatData = 
    {
      user: game.user._id,
      speaker: this.actor.name,
      content: messageHeader + messageContent,      
    };

    let r = new Roll("1d20 + @score", {score});
    r.toMessage(chatData);
  }
}
