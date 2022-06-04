const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    name: "add_owner",
    description: "Add new owner to your voice channel.",
    options: [
        {
            name: "user",
            description: "the user you want to be owner in your channel",
            type: 6,
            required: true
        }
    ],
    voiceOnly: true,
    tempOnly: true,
    tempOwnerOnly: true,
    run: async(interaction, voiceData, client) => {
        // get user
        const user = interaction.options.getUser('user');

        // ignore bots
        if (user.bot) {
            return interaction.reply({
                content: ":x: Bots can't be owner in your channel.",
                ephemeral: true
            });
        }

        // check if user is already owner in channel
        if (voiceData.owners.includes(user.id)) {
            return interaction.reply({
                content: `:x: ${user} already owner in your channel.`,
                ephemeral: true
            });
        }

        // fetch all channels
        const fetchChannels = await client.db.all("channels");

        // filter channels by author id
        const filterChannels = fetchChannels.filter(r => r.data.owners.includes(interaction.user.id));

        // check if there no channels
        if (!filterChannels.length) {
            return interaction.reply({
                content: ":x: You don't have any voice channels.",
                ephemeral: true
            });
        }

        // create row with component
        const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('owner_accept')
            .setLabel('Confirm')
            .setStyle('SUCCESS')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('owner_deny')
            .setLabel('Cancel')
            .setStyle('DANGER')
        )

        // send interaction with components
        interaction.reply({
            content: `⚠ Are you sure you want to add new owner to your channel?`,
            components: [row]
        });

        // create filter for component to only allow author of interaction to click buttons
        const filter = (i) => ['owner_accept', 'owner_deny'].includes(i.customId) && i.user.id === interaction.user.id;

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60_000 });

        // collect even
        collector.on('collect', async (i) => {
            // check for accept
            if (i.customId === 'owner_accept') {
                // push new user id to owners array
                await client.db.push('channels', `${interaction.member.voice.channel.id}.owners`, user.id);

                // edit interaction
                return interaction.editReply({
                    content: `✅ Added new owner ${user}!`,
                    components: []
                });
            }

            // check for cancel
            if (i.customId === 'owner_deny') {
                // edit interaction and remove components
                interaction.editReply({
                    content: "🤔 - Canceled",
                    components: []
                });
            }
        })

        // check for end collector
        collector.on('end', async (i) => {
            if (collector.collected) return;
            interaction.editReply({
                content: `⏲ Time is over!`,
                components: []
            })
        })
    }
}