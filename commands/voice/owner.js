const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    name: "owner",
    description: "Transfer ownership to another user",
    options: [
        {
            name: "user",
            description: "user to transfer to.",
            type: 6,
            required: true
        }
    ],
    voiceOnly: true,
    tempOnly: true,
    tempOwnerOnly: true,
    run: async(interaction, voiceData, client) => {
        // get user from option
        const user = interaction.options.getUser('user');

        // check if user is bot
        if (user.bot) {
            return interaction.reply({
                content: ":x: You can't transfer your channel to bot!",
                ephemeral: true
            })
        }

        // check if user transfer ownership to himself
        if (user.id === interaction.user.id) {
            return interaction.reply({
                content: ":x: You already owner of this channel.",
                ephemeral: true
            })
        }

        // fetch all channels
        const fetchAllChannels = await client.db.all("channels");

        // filter channels by interaction user id
        const filteredChannels = fetchAllChannels.filter(r => r.data.owners.includes(interaction.user.id));

        // check if not user has any channel
        if (!filteredChannels.length) {
            return interaction.reply({
                content: ":x: You don't have any voice channels to transfer.",
                ephemeral: true
            });
        }

        // create row with components to alert user
        const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('confirm_transfer')
            .setLabel('Confirm')
            .setStyle('SUCCESS')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('cancel_transfer')
            .setLabel('Cancel')
            .setStyle('DANGER')
        )

        // send interaction to buttons
        interaction.reply({
            content: `⚠ Are you sure you want to transfer your ownership to ${user}`,
            components: [row]
        });

        // create filter for component to only allow author of interaction to click buttons
        const filter = (i) => ['confirm_transfer', 'cancel_transfer'].includes(i.customId) && i.user.id === interaction.user.id;

        // create component collector
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60_000 });

        // listen to collect even
        collector.on('collect', async (i) => {
            // check if custom id is "confirm_transfer"
            if (i.customId === 'confirm_transfer') {
                // change owner id to new id
                await client.db.push('channels', `${voiceData.channel}.owners`, user.id);

                // edit interaction and remove components
                interaction.editReply({
                    content: `✅ Your temp channel has been transfered to ${user}!`,
                    components: []
                });
            }

            // check if custom id is "cancel_transfer"
            if (i.customId === 'cancel_transfer') {
                // edit reply and remove components
                interaction.editReply({
                    content: "✅ Transfer ownership has been canceled.",
                    components: []
                });
            }
        })

        // listen to end collector
        collector.on('end', async (i) => {
            // edit interaction
            interaction.editReply({
                content: "⏲ time is over!",
                components: []
            })
        })
    }
}
