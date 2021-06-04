// Import Modules
import { KnaveActor } from "./actor/actor.js";
import { KnaveActorSheet } from "./actor/actor-sheet.js";
import { KnaveItem } from "./item/item.js";
import { KnaveItemSheet } from "./item/item-sheet.js";

Hooks.once('init', async function() {

  game.knave = {
    KnaveActor,
    KnaveItem
  };

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d20",
    decimals: 2
  };

  // Define custom Entity classes
  CONFIG.Actor.documentClass = KnaveActor;
  CONFIG.Item.documentClass = KnaveItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("knave", KnaveActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("knave", KnaveItemSheet, { makeDefault: true });

  // If you need to add Handlebars helpers, here are a few useful examples:
  Handlebars.registerHelper('concat', function() {
    var outStr = '';
    for (var arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper('toLowerCase', function(str) {
    return str.toLowerCase();
  });

  Handlebars.registerHelper('isWeapon', function(item)
  {
      return (item.type === 'weaponMelee' || item.type === 'weaponRanged');
  });

  Handlebars.registerHelper('inventorySlots', function(inventorySlots)
  {
      if(inventorySlots.used >= inventorySlots.value)
        return new Handlebars.SafeString('<span class="knave-encumbered">' + inventorySlots.used + "/" + inventorySlots.value + "</span>");
      else
        return new Handlebars.SafeString(inventorySlots.used + "/" + inventorySlots.value);
  });

  Handlebars.registerHelper('isItemBroken', function(item)
  {
    if(item.type === "spell")
      return (item.data.data.used === "true" || !item.data.data.spellUsable);
    else
    {
      if(item.data.data.quality)
        return item.data.data.quality.value <= 0;
      else
        return false;
    }
  });

  Handlebars.registerHelper('hasQuality', function(item)
  {
    return item.data.data.quality !== undefined;
  });
});