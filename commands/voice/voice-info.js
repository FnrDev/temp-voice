const { MessageEmbed } = require('discord.js');

module.exports = {
    name: "voice-info",
    description: "Show details about voice channel",
    options: [
        {
            name: "channel",
            description: "Channel to show info about",
            type: 7,
            channel_types: [2]
        }
    ],
    timeout: 5000,
    run: async(interaction, _, client) => {
        // get channel
        const channel = interaction.options.getChannel('channel') || interaction.member.voice.channel;

        // check if member in voice channel
        if (!channel) {
            return interaction.reply({
                content: ":x: I can't find your temp voice channel, Please select channel from command options",
                ephemeral: true
            })
        }
    
        // find channel in database
        const voiceChannelData = await client.db.get('channels', channel.id);

        // check if there no temp channel in database
        if (!voiceChannelData) {
            return interaction.reply({
                content: ':x: This is not a temp channel.',
                ephemeral: true
            })
        }

        // Create embed with data in it
        const embed = new MessageEmbed()
        .setTitle(`ℹ ${channel.name} Info`)
        .setColor('RANDOM')
        .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .addFields(
            {
                name: "Voice Owner(s)",
                value: voiceChannelData.owners.map(r => { return `<@${r}>` }).join(", ")
            },
            {
                name: "Voice Manager(s)",
                value: voiceChannelData.managers.length > 0 ? voiceChannelData.managers.map(r => { return `<@${r}>` }).join(", ") : 'No Managers'
            },
            {
                name: "Allowed User(s)",
                value: voiceChannelData.allowed_users.length > 0 ? voiceChannelData.allowed_users.map(r => { return `<@${r}>` }).join(", ") : 'No Users'
            }
        )

        // send embed
        interaction.reply({
            embeds: [embed]
        })
    }
}