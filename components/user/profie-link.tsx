import Image from 'next/image';
import Link from 'next/link';

type Props = {
  imgUrl: string;
  href?: string;
  title: string;
};

export function ProfileLink(props: Props) {
  const { imgUrl, href, title } = props;

  return (
    <div className="flex-center gap-1">
      <Image src={imgUrl} alt={title} width={20} height={20} />
      {href
        ? (
            <Link
              href={href}
              target="_blank"

              rel="noopener noreferrer"
              className="paragraph-medium text-link-100"
            >
              {title}
            </Link>
          )
        : (
            <p className="paragraph-medium text-dark400_light700">{title}</p>
          )}
    </div>
  );
}
