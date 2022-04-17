const { WebhookClient } = require('discord.js');
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

    // fetch all webhooks from log channel and filter webhooks created by the bot
    const fetchWebhooks = await logChannel.fetchWebhooks();
    const filterdWebhooks = fetchWebhooks.filter(r => r.owner.id === client.user.id);

    // check if there non webhooks created by the bot
    if (!filterdWebhooks.size) {
        // create webhook for log channel
        const webhookData = await logChannel.createWebhook('Temp Channel Logger', { reason: "Temp channels logger" });

        // create webhook client
        const webhook = new WebhookClient({ url: webhookData.url });

        // send log using webhook
        webhook.send({
            content: `✅ Created temp channel for ${member.user.tag} (\`${member.id}\`) `
        })
    }
}