const { WebhookClient } = require('discord.js');
const { log_channel_id } = require('../../settings.json');

module.exports = async(client, member, channel) => {
    await client.db.delete('channels', channel.id);
    console.log(`❌ Channel Deleted! owner ${member.user.tag} (${member.id})`);

    // find log channel
    const logChannel = member.guild.channels.cache.get(log_channel_id);
    if (!logChannel) return console.log(`[Temp Channel] i can't find log channel with ${log_channel_id} id`.red);

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
            content: `❌ Deleted temp channel for ${member.user.tag} (\`${member.id}\`)`
        })
    }

    // // create webhook client if exits
    // const webhook = new WebhookClient({ url: filterdWebhooks.url })

    // // send webhook
    // webhook.send({
    //     content: `❌ Deleted temp channel for ${member.user.tag} (\`${member.id}\`)`
    // })
}