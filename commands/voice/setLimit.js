module.exports = {
    name: "limit",
    description: "Set limit to your voice channel.",
    options: [
        {
            name: "number",
            description: "number of members want to join your voice channel.",
            type: 4,
            required: true
        }
    ],
    voiceOnly: true,
    timeout: 15000,
    tempOnly: true,
    allowManagers: true,
    run: async(interaction) => {
        // get number of limit from option.
        const number = interaction.options.getInteger('number');

        // edit channel limit
        await interaction.member.voice.channel.edit({ userLimit: number }).catch(console.error);

        // Reply to interaction.
        interaction.reply({
            content: `✅ | **Channel has been set to \`${number}\` members**`
        }).catch(console.error);
    }
}