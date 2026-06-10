import type { ReactNode } from 'react';

const URL_REGEX = /https?:\/\/[^\s<]+[^\s<.,;:!?)}\]"']/gi;

export function linkifyText(
    text: string,
    linkClassName = 'underline break-all hover:opacity-80',
): ReactNode[] {
    const nodes: ReactNode[] = [];
    let lastIndex = 0;

    for (const match of text.matchAll(URL_REGEX)) {
        const index = match.index ?? 0;

        if (index > lastIndex) {
            nodes.push(
                <span key={`text-${lastIndex}`}>
                    {text.slice(lastIndex, index)}
                </span>,
            );
        }

        nodes.push(
            <a
                key={`link-${index}`}
                href={match[0]}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClassName}
            >
                {match[0]}
            </a>,
        );

        lastIndex = index + match[0].length;
    }

    if (lastIndex < text.length) {
        nodes.push(
            <span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>,
        );
    }

    return nodes.length > 0 ? nodes : [text];
}
