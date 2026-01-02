import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const Terms: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-blue-600 mb-8 transition"
      >
        <ArrowLeft size={20} className="mr-2" /> 返回上一页
      </button>

      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">FUHUNG ART INDEX 用户服务协议</h1>
          <p className="text-gray-500 text-sm">最后更新日期：2026年01月01日</p>
        </div>

        <div className="prose prose-blue max-w-none text-gray-600 space-y-8">
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">1. 导言</h3>
            <p>
              欢迎您使用 FUHUNG ART INDEX（以下简称“本平台”）。本协议是您与本平台之间关于您使用本平台服务所订立的协议。
              请您在注册成为会员或使用本平台服务前，仔细阅读本协议。当您勾选“我已阅读并同意”或开始使用本平台服务时，即视为您已签署本协议并同意接受本协议的约束。
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">2. 服务内容</h3>
            <p>
              本平台致力于为用户提供全球艺术品拍卖数据的查询、分析及收藏服务。具体服务内容包括但不限于：
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>艺术品历史成交数据的检索与浏览；</li>
              <li>市场指数分析与图表展示；</li>
              <li>个性化收藏夹与数据管理；</li>
              <li>平台提供的其他相关服务。</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">3. 用户账号与安全</h3>
            <p>
              3.1 您在注册时承诺提供真实、准确、完整的个人资料（包括姓名、邮箱等）。<br/>
              3.2 您的账号仅限您本人使用，禁止赠与、借用、租用、转让或售卖账号。<br/>
              3.3 您有责任妥善保管注册账号信息及账号密码的安全，因您保管不善可能导致遭受盗号或资产损失，责任由您自行承担。
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">4. 用户行为规范</h3>
            <p>您在使用本平台服务过程中，不得从事以下行为：</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>使用任何自动化程序、软件或爬虫工具抓取本平台数据；</li>
              <li>对本平台服务进行反向工程、反向汇编或反向编译；</li>
              <li>发布含有法律、行政法规禁止的内容；</li>
              <li>利用本平台从事洗钱、窃取商业秘密等违法犯罪活动。</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">5. 知识产权声明</h3>
            <p>
              本平台包含的所有文本、图表、用户界面、可视界面、图片、商标、标识、声音、音乐、美术作品及计算机编码（合称为“内容”），
              均归本平台或相关权利人所有。未经书面许可，任何人不得以任何方式（包括“镜像”）将本平台的任何部分或任何内容复制、转载或分发。
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">6. 免责声明</h3>
            <p>
              本平台提供的拍卖数据仅供参考，不构成对艺术品真伪、价值的任何保证或投资建议。
              用户依据本平台数据进行的任何交易或投资决策，由用户自行承担风险和责任。
            </p>
          </section>
          
          <div className="pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
            <p>FUHUNG ART INDEX 保留对本协议的最终解释权</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
