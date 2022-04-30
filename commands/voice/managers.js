const { MessageActionRow, MessageSelectMenu } = require('discord.js');

module.exports = {
    name: "managers",
    description: "Add managers to control in your voice channel",
    tempOnly: true,
    tempOwnerOnly: true,
    voiceOnly: true,
    run: async(interaction, voiceData, client) => {
        // assign to this array latter
        const allManagers = [];

        // get all voice members
        const voiceMembers = interaction.member.voice.channel.members;

        // check if there no members in channel
        if (voiceMembers.size == 1) {
            return interaction.reply({
                content: ':x: There are no members in your voice channel',
                ephemeral: true
            })
        }

        // loop every member in voice channel
        voiceMembers.map(member => {
            allManagers.push({
                label: member.user.tag,
                description: member.id,
                value: member.id
            })
        })

        // create select menu
        const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
            .setCustomId('managers_select')
            .setPlaceholder('Choose managers')
            .addOptions(allManagers)
            .setMaxValues(voiceMembers.size)
        )

        interaction.reply({
            content: 'Select user in your voice channel to be a voice manager',
            components: [row]
        })

        // create filter
        const filter = (i) => i.customId === 'managers_select' && i.user.id === interaction.user.id;

        // create collector
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30_000 });

        collector.on('collect', async (i) => {
            // check if user manager
            const alreadyManagers = []
            i.values.map((member) => {
                if (voiceData.managers.includes(member)) {
                    alreadyManagers.push(member);
                }
            });
            if (alreadyManagers.length) {
                // send interaction with managers mention
                return interaction.editReply({
                    content: `:x: ${alreadyManagers.map(r => { return `<@${r}>` }).join(", ")} is already manager${allManagers.length > 2 ? 's' : ''} in your voice channel.`,
                    components: []
                });
            }
            i.values.forEach(async (member) => {
                await client.db.push('channels', `${interaction.member.voice.channelId}.managers`, member);
            })
            return interaction.editReply({
                content: `✅ ${i.values.map(member => { return `<@${member}>` }).join(", ")} has been added to voice managers.`,
                components: []
            })
        })

        collector.on('end', i => {
            if (collector.collected) return;
            return interaction.editReply({
                content: 'TIME ENDED!',
                components: []
            })
        })
    }
}