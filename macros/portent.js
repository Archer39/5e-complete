const portentDice = actor.system.scale["school-of-divination"].portent;
let portents = item.getFlag("world", "portents");
if(!portents) return reRoll();
let myButtons = await getButtons();
new Dialog({
    title: "Portent",
    content: "How will you alter fate?",
    buttons: myButtons
}, {
    classes: ["dialog", `portent-dialog-${portents.length}`]
}).render(true);

async function getButtons() {
    let myButtons = portents.reduce((buttons, roll) => {
        buttons[roll] = {
            icon: `<i class="fas fa-dice-d20"></i>`,
            label: `${roll}`,
            callback: async () => {
                const rollToChat = await new Roll("1d20").evaluate();
                rollToChat._total = roll; // Convert flag to die result
                rollToChat.terms[0].results[0].result = roll; // Convert flag to die result
                rollToChat.toMessage({flavor: "I foresaw this event and choose to roll:"});
                portents.splice(portents.indexOf(roll), 1);
                await item.setFlag("world", "portents", portents);
            }
        };
        return buttons;
    }, {});
    myButtons.reset = {
        icon: `<i class="fas fa-rotate-right"></i>`,
        label: `Roll New Portents`,
        callback: async () => {
            return reRoll();
        }
    };
    return myButtons;
}

async function reRoll() {
    const use = await item.use(); // Roll item
    const rolls = await Promise.all(Array.fromRange(portentDice).map(n => {
        return new Roll("1d20").evaluate({async: true});
    }));
    const rollOutput = rolls.reduce((acc, roll) => {
      return acc + `
      <div class="dice-roll dice-roll-columns-${portentDice}">
        <div class="dice-result">
          <div class="dice-formula">1d20</div>
          <div class="dice-tooltip">
            <section class="tooltip-part">
              <div class="dice">
                <header class="part-header flexrow">
                  <span class="part-formula">1d20</span>
                  <span class="part-total">${roll.total}</span>
                </header>
                <ol class="dice-rolls">
                  <li class="roll die d20">${roll.total}</li>
                </ol>
              </div>
            </section>
          </div>
          <h4 class="dice-total">${roll.total}</h4>
        </div>
      </div>`;
    }, "");
    const chatData = {
        speaker: ChatMessage.getSpeaker(),
        flavor: "Will there be fortune or calamity today?",
        content: rollOutput
    };
    ChatMessage.applyRollMode(chatData, game.settings.get("core", "rollMode"));
    await ChatMessage.create(chatData);
    rolls.map(r => game.dice3d?.showForRoll(r, game.user, true));
    rolls.sort(function(a,b){a-b});
    await item.setFlag("world", "portents", rolls.map(r => r.total));
}