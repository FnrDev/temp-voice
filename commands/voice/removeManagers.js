const { MessageActionRow, MessageSelectMenu } = require('discord.js');

module.exports = {
    name: "remove_manager",
    description: "Remove manager from your voice channel",
    tempOnly: true,
    voiceOnly: true,
    tempOwnerOnly: true,
    run: async(interaction, voiceData, client) => {
        // check if there no manager in voice channel
        if (!voiceData.managers.length > 0) {
            return interaction.reply({
                content: ':x: There are no managers in your voice channel.',
                ephemeral: true
            })
        };
    
        // create empty array to push data latter.
        const managers = [];

        // fetch all managers in voice channel
        const fetchManagers = await interaction.guild.members.fetch({ user: voiceData.managers });

        // loop every manager and push them to manager array
        fetchManagers.forEach(member => {
            managers.push({
                label: member.user.tag,
                description: voiceData.owners.includes(member.id) ? 'Voice Owner & Manager' : 'Voice Manager',
                value: member.id,
                emoji: voiceData.owners.includes(member.id) ? '<:BadgeOwnerCrown:946893402887315516>' : '<:topggCommunityManager:916114556852535307>'
            })
        });
        
        // create row with select menu component
        const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
            .setCustomId('manager_remove')
            .setPlaceholder('Choose manager')
            .addOptions(managers)
            .setMaxValues(fetchManagers.size)
        )

        // send select menu component
        interaction.reply({
            content: "**Choose manager**",
            components: [row]
        })

        // create filter for component collector
        const filter = (i) => i.customId === 'manager_remove' && i.user.id === interaction.user.id;

        // create component collector
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 20_000 });

        // collect event
        collector.on('collect', i => {
            if (i.customId === 'manager_remove') {
                // loop for every manager has been selected
                i.values.map((r) => {
                    // find user id index
                    const index = voiceData.managers.indexOf(r);
                    if (index > -1) {
                        voiceData.managers.splice(index, 1);
                    }
                })

                // set new data
                client.db.set('channels', voiceData.channel, voiceData);

                // edit interaction
                interaction.editReply({
                    content: `✅ ${i.values.map(r => { return `<@${r}>` }).join(", ")} has been removed from voice managers`,
                    components: []
                })
            }
        })

        // end collector
        collector.on('end', i => {
            if (collector.collected) return;
            // edit interaction
            interaction.editReply({
                content: '⏲ TIME IS UP!',
                components: []
            })
        })
    }
}