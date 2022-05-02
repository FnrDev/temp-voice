module.exports = async (client, channel) => {
    // ignore any channel type if it's not voice
    if (channel.type !== 'GUILD_VOICE') return;

    // check if channel has data
    const getTempData = await client.db.get('channels', channel.id);

    // if channel has data delete data from database
    if (getTempData) {
        await client.db.delete('channels', channel.id);
    }
}