"use client";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import type { Post } from "@/lib/cms";
import { absolutePostURL } from "@/lib/utils";
import { notifyWhenDone } from "@/components/Toaster";
import AnimatedCheckbox from "@/components/AnimatedCheckbox";

export default function SocialShare({ post }: { post: Post }) {
  const [copy] = useCopyToClipboard();
  const postURL = absolutePostURL(post.slug);
  return (
    <>
      <li>
        <div
          className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-all duration-200 hover:border-primary hover:text-primary"
          aria-label="Copy the Canonical link"
        >
          <AnimatedCheckbox
            className="h-5 w-5"
            onClick={async () => {
              await notifyWhenDone(copy(postURL));
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12.7076 18.3639L11.2933 19.7781C9.34072 21.7308 6.1749 21.7308 4.22228 19.7781C2.26966 17.8255 2.26966 14.6597 4.22228 12.7071L5.63649 11.2929M18.3644 12.7071L19.7786 11.2929C21.7312 9.34024 21.7312 6.17441 19.7786 4.22179C17.826 2.26917 14.6602 2.26917 12.7076 4.22179L11.2933 5.636M8.50045 15.4999L15.5005 8.49994"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </AnimatedCheckbox>
        </div>
      </li>
      <li>
        <a
          target="_blank"
          rel="noopener"
          href={`https://twitter.com/share?url=${postURL}`}
          className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-all duration-200 hover:border-primary hover:text-primary"
        >
          <span className="sr-only">Twitter</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="h-5 w-5"
          >
            <path d="M19.633 7.997c.013.175.013.349.013.523 0 5.325-4.053 11.461-11.46 11.461-2.282 0-4.402-.661-6.186-1.809.324.037.636.05.973.05a8.07 8.07 0 0 0 5.001-1.721 4.036 4.036 0 0 1-3.767-2.793c.249.037.499.062.761.062.361 0 .724-.05 1.061-.137a4.027 4.027 0 0 1-3.23-3.953v-.05c.537.299 1.16.486 1.82.511a4.022 4.022 0 0 1-1.796-3.354c0-.748.199-1.434.548-2.032a11.457 11.457 0 0 0 8.306 4.215c-.062-.3-.1-.611-.1-.923a4.026 4.026 0 0 1 4.028-4.028c1.16 0 2.207.486 2.943 1.272a7.957 7.957 0 0 0 2.556-.973 4.02 4.02 0 0 1-1.771 2.22 8.073 8.073 0 0 0 2.319-.624 8.645 8.645 0 0 1-2.019 2.083z"></path>
          </svg>
        </a>
      </li>
      <li>
        <a
          target="_blank"
          rel="noopener"
          href={`https://www.facebook.com/sharer/sharer.php?u=${postURL}`}
          className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-all duration-200 hover:border-primary hover:text-primary"
        >
          <span className="sr-only">Facebook</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="h-5 w-5"
          >
            <path d="M12.001 2.002c-5.522 0-9.999 4.477-9.999 9.999 0 4.99 3.656 9.126 8.437 9.879v-6.988h-2.54v-2.891h2.54V9.798c0-2.508 1.493-3.891 3.776-3.891 1.094 0 2.24.195 2.24.195v2.459h-1.264c-1.24 0-1.628.772-1.628 1.563v1.875h2.771l-.443 2.891h-2.328v6.988C18.344 21.129 22 16.992 22 12.001c0-5.522-4.477-9.999-9.999-9.999z"></path>
          </svg>
        </a>
      </li>
      <li>
        <a
          target="_blank"
          rel="noopener"
          href={`https://www.linkedin.com/share?url=${postURL}`}
          className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-all duration-200 hover:border-primary hover:text-primary"
        >
          <span className="sr-only">LinkedIn</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="h-5 w-5"
          >
            <path d="M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM8.339 18.337H5.667v-8.59h2.672v8.59zM7.003 8.574a1.548 1.548 0 1 1 0-3.096 1.548 1.548 0 0 1 0 3.096zm11.335 9.763h-2.669V14.16c0-.996-.018-2.277-1.388-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248h-2.667v-8.59h2.56v1.174h.037c.355-.675 1.227-1.387 2.524-1.387 2.704 0 3.203 1.778 3.203 4.092v4.71z"></path>
          </svg>
        </a>
      </li>
    </>
  );
}
