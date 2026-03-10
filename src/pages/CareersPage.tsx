import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { Briefcase, MapPin, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const openings = [
  { title: "Senior Frontend Developer", dept: "Engineering", location: "Lahore", type: "Full-time" },
  { title: "Product Designer", dept: "Design", location: "Remote", type: "Full-time" },
  { title: "Customer Support Lead", dept: "Operations", location: "Karachi", type: "Full-time" },
  { title: "Marketing Manager", dept: "Marketing", location: "Islamabad", type: "Full-time" },
  { title: "Logistics Coordinator", dept: "Operations", location: "Lahore", type: "Full-time" },
  { title: "Data Analyst", dept: "Engineering", location: "Remote", type: "Contract" },
];

const CareersPage = () => (
  <>
    <SEOHead title="Careers - FANZOON" description="Join FANZOON and help build Pakistan's leading marketplace." url="/careers" />
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-20">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Join Our Team</h1>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">Be part of Pakistan's e-commerce revolution. We're looking for passionate people to help build the future of online shopping.</p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center gap-2 mb-8">
              <Users className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-display font-bold text-foreground">Open Positions</h2>
              <span className="ml-auto bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">{openings.length} openings</span>
            </div>
            <div className="space-y-4">
              {openings.map((job) => (
                <div key={job.title} className="bg-card rounded-2xl p-6 border border-border hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{job.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Briefcase size={14} />{job.dept}</span>
                        <span className="flex items-center gap-1"><MapPin size={14} />{job.location}</span>
                        <span className="flex items-center gap-1"><Clock size={14} />{job.type}</span>
                      </div>
                    </div>
                    <Button className="rounded-xl">Apply Now</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  </>
);

export default CareersPage;
