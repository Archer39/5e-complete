// Pull from local table
const randomAdj = (await game.tables.getName("table with adjectives").roll()).results[0].getChatText();
const randomNoun = (await game.tables.getName("table with nouns").roll()).results[0].getChatText();
const randomWeap = (await game.tables.getName("table with weapon names").roll()).results[0].getChatText();
const message = `You see a ${randomAdj} ${randomNoun} wielding a ${randomWeap}.`;
await ChatMessage.create({content: message});

// Pull from compendium
const firstTable = (await game.packs.get("compendium-slug.table-slug").getDocument("table-id").roll()).results[0].getChatText();
const secondTable =(await game.packs.get("compendium-slug.table-slug").getDocument("table-id").roll()).results[0].getChatText();
const message = `Your results are ${firstTable} and ${secondTable}!`;
await ChatMessage.create({content: message});