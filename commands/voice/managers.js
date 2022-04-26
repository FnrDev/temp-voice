const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    name: "managers",
    description: "Add managers to control in your voice channel",
    options: [
        {
            name: "user",
            description: "User to be manager",
            type: 6,
            required: true
        }
    ],
    tempOnly: true,
    tempOwnerOnly: true,
    voiceOnly: true,
    run: async(interaction, _, client) => {
        // get user from option
        const user = interaction.options.getUser('user');

        // check if user already manager in voice channel
        const isManager = await client.db.includes('channels', `${interaction.member.voice.channel.id}.managers`, user.id);
        if (isManager) {
            return interaction.reply({
                content: `:x: ${user} is already manager in your voice channel`,
                ephemeral: true
            })
        }

        // create row with button components
        const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('managers_accept_transfer')
            .setLabel('Accept')
            .setStyle('SUCCESS')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('managers_deny_transfer')
            .setLabel('Cancel')
            .setStyle('DANGER')
        )

        // send components
        interaction.reply({
            content: `⚠ **Are you sure you want to add ${user} to voice managers?**`,
            components: [row]
        })

        // create filter for components 
        const filter = (i) => ['managers_accept_transfer', 'managers_deny_transfer'].includes(i.customId) && i.user.id === interaction.user.id;

        // create collector
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30_000 });

        // collect event
        collector.on('collect', async i => {
            if (i.customId === 'managers_accept_transfer') {
                // push user id to managers array
                await client.db.push('channels', `${interaction.member.voice.channel.id}.managers`, user.id);

                // edit interaction
                interaction.editReply({
                    content: `✅ ${user} has been added to channel managers`,
                    components: []
                });
            }

            if (i.customId === 'managers_deny_transfer') {
                // remove component if user cancel
                interaction.editReply({
                    content: '**🤔 - Canceling ...**',
                    components: []
                });
            }
        })

        // end collector
        collector.on('end', () => {
            if (collector.collected) return;
            interaction.editReply({
                content: '⏲ - TIME OVER!',
                components: []
            });
        })
    }
}