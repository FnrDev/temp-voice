const { log_channel_id } = require('../../settings.json');

module.exports = async(client, member, channel) => {
    // save channel data in database
    await client.db.set('channels', channel.id, {
        owners: [member.id],
        channel: channel.id,
        managers: []
    });

    // allow channel owner with connect, manage channel
    await channel.permissionOverwrites.edit(member.user, {
        MANAGE_CHANNELS: true,
        CONNECT: true
    });

    // deny connect permission from everyone
    await channel.permissionOverwrites.edit(member.guild.id, {
        CONNECT: false
    });

    console.log(`✅ Done! created temp channel for ${member.user.tag} (${member.id})`);

    // find log channel
    const logChannel = member.guild.channels.cache.get(log_channel_id);
    if (!logChannel) return console.error(`[Temp Channel] i can't find log channel with ${log_channel_id} id`);

    // send log to channel
    logChannel.send({
        content: `✅ Done! created temp channel for ${member.user.tag} (${member.id})`
    })
}