import type { Metadata } from "next";
import Link from "next/link";
import { buttonClass, PageBody, Table, Td, Th } from "@/components/ui";
import { services } from "@/data/services";

export const metadata: Metadata = { title: "Services" };

export default function ServicesPage() {
  return (
    <PageBody>
      <h1>Services</h1>
      <p className="mt-4 mb-8 max-w-[56ch] text-muted">
        Every service ends with files you can print or send: PDF for review and DWG for your engineer.
      </p>
      <Table>
        <thead>
          <tr>
            <Th scope="col">Service</Th>
            <Th scope="col">What it is</Th>
            <Th scope="col">What you receive</Th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <tr key={s.name}>
              <Td>
                <b>{s.name}</b>
              </Td>
              <Td>{s.summary}</Td>
              <Td>{s.deliverables}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/contact" className={buttonClass()}>
          Ask for a quote
        </Link>
      </div>
    </PageBody>
  );
}
