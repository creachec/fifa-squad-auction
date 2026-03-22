export const compressImage = (file: File, maxSize: number = 256): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }

                canvas.width = maxSize;
                canvas.height = maxSize;

                const ctx = canvas.getContext('2d');
                if (!ctx) return reject('Failed to get canvas context');

                ctx.fillStyle = '#1a1f26';
                ctx.fillRect(0, 0, maxSize, maxSize);

                const x = (maxSize - width) / 2;
                const y = (maxSize - height) / 2;
                ctx.drawImage(img, x, y, width, height);

                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject('Canvas to Blob failed');
                }, 'image/jpeg', 0.85);
            };
            img.onerror = error => reject(error);
        };
        reader.onerror = error => reject(error);
    });
};

export const uploadAvatar = async (file: File): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        try {
            const compressedBlob = await compressImage(file);

            const reader = new FileReader();
            reader.readAsDataURL(compressedBlob);
            reader.onloadend = () => {
                resolve(reader.result as string);
            };
            reader.onerror = reject;
        } catch (error) {
            console.error('Image Processing Error:', error);
            reject(error);
        }
    });
};
