import Link from "next/link";
import { 
  Settings, 
  Image as ImageIcon, 
  ArrowRight,
  Sparkles,
  Code,
  Palette
} from "lucide-react";

export default function Home() {
  const tools = [
    {
      title: "Firebase Environment Converter",
      description: "Convert Firebase configuration objects to environment variables format for secure deployment",
      icon: Settings,
      href: "/firebase/env",
      color: "from-orange-400 to-red-500",
      features: ["Parse Firebase config", "Generate .env files", "Copy to clipboard"]
    },
    {
      title: "PWA Icon Generator",
      description: "Generate complete icon sets for Progressive Web Apps from a single image",
      icon: ImageIcon,
      href: "/pwa/generate-icons",
      color: "from-blue-400 to-purple-500",
      features: ["Multiple sizes", "Favicon generation", "ZIP download"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            DC Tools
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A collection of developer tools to streamline your workflow and boost productivity
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {tools.map((tool, index) => (
            <Link
              key={index}
              href={tool.href}
              className="group block"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-transparent">
                {/* Card Header */}
                <div className={`h-2 bg-gradient-to-r ${tool.color}`} />
                
                <div className="p-8">
                  {/* Icon and Title */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-r ${tool.color} rounded-xl`}>
                      <tool.icon className="w-6 h-6 text-white" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {tool.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {tool.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {tool.features.map((feature, featureIndex) => (
                      <span
                        key={featureIndex}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <div className="flex items-center justify-center gap-6 text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              <span className="text-sm">Built with Next.js</span>
            </div>
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="text-sm">Styled with Tailwind CSS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
