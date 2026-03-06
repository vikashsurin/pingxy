export const ModerationService = {
  // When handling image message upload
  handleImageUpload: async (imageBuffer: Buffer, messageId: string) => {
    const formData = new FormData();
    formData.append("file", new Blob([imageBuffer]), "image.jpg");

    const res = await fetch("http://localhost:8000/moderate", {
      method: "POST",
      body: formData,
    });

    const { flagged, confidence } = await res.json();

    // Save to your DB alongside the message
    //   await db.message.update({
    //     where: { id: messageId },
    //     data: {
    //       isNsfw: flagged && confidence > 0.85,
    //     },
    //   });

    // Broadcast updated message state to clients via websocket
    //   broadcastToRoom(roomId, {
    //     type: "message:moderated",
    //     messageId,
    //     isNsfw: flagged,
    //   });
  },
};
