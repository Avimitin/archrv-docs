import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import CodeBlock from '@theme/CodeBlock';
import useSWR from 'swr';

const fetcher = (...args) => fetch(...args).then(res => res.text());

function getBlackList() {
  const url = "https://raw.githubusercontent.com/felixonmars/archriscv-packages/master/blacklist.txt";
  const {data, error} = useSWR(url, fetcher);
  return {
    text: data,
    isLoading: !error && !data,
    isError: error,
  }
}

function textToList(s) {
  const lines = s.split(/\r?\n/);
  return (
    <ul>
    {lines.map(function (s) {
      if (!s.startsWith("# ")) {
        return <li>{s}</li>;
      } else {
        return <b>{s.replace("# ", "")}</b>;
      }
    })}
    </ul>
  );
}

export default function RenderBlacklist() {
  return (
    <BrowserOnly fallback={<b>Loading Blacklist...</b>}>
      {() => {
        const {text, isLoading, isError} = getBlackList();

        if (isLoading) return <b>Loading...</b>;
        if (isError) return <b>Fail to load blacklist</b>;

        return <ul>{textToList(text)}</ul>
      }}
    </BrowserOnly>
  );
}
