const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!uploadMedia) return;

  const files = Array.from(e.target.files || []);

  // Check for video files exceeding 1MB limit
  const invalidFiles = files.filter(
    (file) => file.type.startsWith("video/") && file.size > 1024 * 1024
  );

  if (invalidFiles.length > 0) {
    toast.error("Videos must be less than 1MB in size");
    return;
  }

  if (files.length > 0) {
    const file = files[0];

    // For videos, bypass the crop modal and add directly
    if (file.type.startsWith("video/")) {
      const reader = new FileReader();

      reader.onloadend = () => {
        // Add video directly without cropping
        const videoFile = file as CroppedFile;
        videoFile.previewUrl = reader.result as string;

        const newFiles = [...mediaFiles, videoFile].slice(0, 4);
        setMediaFiles(newFiles);

        // Add to previews
        setMediaPreviews((prev) =>
          [...prev, reader.result as string].slice(0, 4)
        );
      };

      reader.readAsDataURL(file);
    } else if (file.type.startsWith("image/")) {
      // Open crop modal for images only
      setCurrentMediaFile(file);
      setIsCropModalOpen(true);
    }
  }
};
