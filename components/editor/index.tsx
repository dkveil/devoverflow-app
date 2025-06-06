'use client';

import type { MDXEditorMethods } from '@mdxeditor/editor';
import type { ForwardedRef } from 'react';

import {
  BoldItalicUnderlineToggles,
  ChangeCodeMirrorLanguage,
  codeBlockPlugin,
  codeMirrorPlugin,
  ConditionalContents,
  CreateLink,
  diffSourcePlugin,
  headingsPlugin,
  imagePlugin,
  InsertCodeBlock,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,

  quotePlugin,
  Separator,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
} from '@mdxeditor/editor';
import { basicDark } from 'cm6-theme-basic-dark';
import { useTheme } from 'next-themes';
import '@mdxeditor/editor/style.css';

import './dark-editor.css';

type Props = {
  value: string;
  editorRef: ForwardedRef<MDXEditorMethods> | null;
  fieldChange: (value: string) => void;
};

export default function Editor({
  value,
  editorRef,
  fieldChange,
  ...props
}: Props) {
  const { resolvedTheme } = useTheme();

  const theme = resolvedTheme === 'dark' ? [basicDark] : [];

  return (
    <MDXEditor
      key={resolvedTheme}
      markdown={value}
      ref={editorRef}
      className="background-light800_dark200 light-border-2 markdown-editor dark-editor w-full border"
      onChange={fieldChange}
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        tablePlugin(),
        imagePlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: '' }),
        codeMirrorPlugin({
          codeBlockLanguages: {
            'css': 'css',
            'txt': 'txt',
            'sql': 'sql',
            'html': 'html',
            'saas': 'saas',
            'scss': 'scss',
            'bash': 'bash',
            'json': 'json',
            'js': 'javascript',
            'ts': 'typescript',
            '': 'unspecified',
            'tsx': 'TypeScript (React)',
            'jsx': 'JavaScript (React)',
          },
          autoLoadLanguageSupport: true,
          codeMirrorExtensions: theme,
        }),
        diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: '' }),
        toolbarPlugin({
          toolbarContents: () => (
            <ConditionalContents
              options={[
                {
                  when: editor => editor?.editorType === 'codeblock',
                  contents: () => <ChangeCodeMirrorLanguage />,
                },
                {
                  fallback: () => (
                    <>
                      <UndoRedo />
                      <Separator />

                      <BoldItalicUnderlineToggles />
                      <Separator />

                      <ListsToggle />
                      <Separator />

                      <CreateLink />
                      <InsertImage />
                      <Separator />

                      <InsertTable />
                      <InsertThematicBreak />

                      <InsertCodeBlock />
                    </>
                  ),
                },
              ]}
            />
          ),
        }),
      ]}
      {...props}
    />
  );
}
