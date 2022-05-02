const { log_channel_id } = require('../../settings.json');

module.exports = async(client, member, channel) => {
    await client.db.delete('channels', channel.id);
    console.log(`❌ Channel Deleted! owner ${member.user.tag} (${member.id})`);

    // find log channel
    const logChannel = member.guild.channels.cache.get(log_channel_id);
    if (!logChannel) return console.log(`[Temp Channel] i can't find log channel with ${log_channel_id} id`.red);

    // send log to channel
    logChannel.send({
        content: `❌ Channel Deleted! **owner:** ${member.user.tag} (${member.id})`
    })
}