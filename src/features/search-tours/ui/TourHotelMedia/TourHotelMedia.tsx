import styles from './TourHotelMedia.module.scss';

interface TourHotelMediaProps {
  hotelName: string;
  imageUrl: string;
  variant?: 'card' | 'detail';
}

export function TourHotelMedia({
  hotelName,
  imageUrl,
  variant = 'card'
}: TourHotelMediaProps) {
  const wrapClass = variant === 'detail' ? styles.imageWrapRounded : styles.imageWrap;

  return (
    <div className={wrapClass}>
      {imageUrl ? (
        <img alt={hotelName} className={styles.image} loading="lazy" src={imageUrl} />
      ) : (
        <div className={styles.imagePlaceholder} role="img" />
      )}
    </div>
  );
}
