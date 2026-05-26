import './globals.css'
import Header from './components/Header' 
import Footer from './components/Footer' 
import { Web3Provider } from '../providers/Web3Provider'
import { Toaster } from 'react-hot-toast'
import { Inter, Roboto_Mono } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const robotoMono = Roboto_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata = {
  title: 'SafeExchange | Enterprise Digital Asset Venue',
  description: '企业级数字资产交易终端，内置行情网关、风控、资产账本、审计流水与钱包签名入口。',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${robotoMono.variable} dark`}>
      <body className="antialiased overflow-x-hidden bg-[#051124]">
        <Web3Provider>
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 flex flex-col pt-14"> 
                    {children}
                </main>
                <Footer />
            </div>
            <Toaster 
              position="top-right"
              reverseOrder={false}
              toastOptions={{
                className: 'border border-blue-500/20 bg-[#08162d] text-white text-xs font-medium',
                duration: 4000,
                style: {
                  borderRadius: '12px',
                  background: '#08162d',
                  color: '#fff',
                },
              }}
            />
        </Web3Provider>
      </body>
    </html>
  );
}
