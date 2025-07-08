import { Code } from 'bright';
import { MDXRemote } from 'next-mdx-remote/rsc';

Code.theme = {
  dark: 'github-dark',
  light: 'github-light',
  lightSelector: 'light.html',

};

export function Preview({ content }: { content: string }) {
  const formattedContent = content.replace(/\\/g, '').replace(/&#x20;/g, '');

  return (
    <section className="markdown prose grid break-words" style={{ wordWrap: 'anywhere' as any }}>
      <MDXRemote
        source={formattedContent}
        components={{
          pre: (props: any) => (
            <Code {...props} lineNumbers className="shadow-light-200 dark:shadow-dark-200" />
          ),
        }}
      />
    </section>
  );
};
