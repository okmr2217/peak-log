import { PageHeader } from "@/components/layout/page-header";
import { BookOpen, Zap, Clock, Star, BarChart2, Settings } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="p-4 max-w-lg mx-auto pb-24">
      <PageHeader title="ヘルプ" description="Peak Log の使い方" />

      <div className="space-y-8">
        {/* Peak Log とは */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Peak Log とは</h2>
          </div>
          <div className="bg-card rounded-xl p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Peak Log は、自分を高揚させた体験を記録・振り返るためのアプリです。
              筋トレの達成感、集中できた勉強時間、楽しかったイベント——そんな
              <span className="text-foreground font-medium">ピーク体験をその瞬間に記録</span>
              し、後から余韻とともに振り返ることができます。
            </p>
          </div>
        </section>

        {/* 3つの概念 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">3つの概念</h2>
          </div>
          <div className="space-y-2">
            <div className="bg-card rounded-xl p-4 space-y-1">
              <p className="text-sm font-medium text-foreground">活動（Activity）</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                何をしたかを表す種類。💪 筋トレ・📚 勉強・❤️ デートなど、自分でカスタマイズして作成します。
              </p>
            </div>
            <div className="bg-card rounded-xl p-4 space-y-1">
              <p className="text-sm font-medium text-foreground">ピーク記録（Log）</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                いつ何をしたかの記録。活動をタップするだけで素早く記録できます。過去の日時を入力することも可能です。
              </p>
            </div>
            <div className="bg-card rounded-xl p-4 space-y-1">
              <p className="text-sm font-medium text-foreground">余韻（Reflection）</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                体験の感想・評価。高揚度・達成感・またやりたいか・メモを任意で記録できます。記録直後でも後からでも追加できます。
              </p>
            </div>
          </div>
        </section>

        {/* 基本の使い方 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">基本の使い方</h2>
          </div>
          <div className="bg-card rounded-xl p-4 space-y-4">
            {[
              { step: "1", title: "活動を作る", desc: "「活動」ページでエモジと色を選んで活動を作成します。" },
              { step: "2", title: "ピークを記録する", desc: "ホームの活動ボタンをタップ。日時を確認して「記録する」を押すだけです。" },
              { step: "3", title: "余韻を追加する（任意）", desc: "記録後に「余韻を追加」をタップ。高揚度・達成感・メモを入力できます。後から詳細モーダルでも追加できます。" },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{step}</span>
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 画面ガイド */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Star size={16} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">画面ガイド</h2>
          </div>
          <div className="space-y-2">
            <div className="bg-card rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={14} className="text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">記録（ホーム）</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                最近のピーク記録をタイムラインで確認できます。下部の活動ボタンをタップしてすぐに記録できます。
              </p>
            </div>
            <div className="bg-card rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <BarChart2 size={14} className="text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">統計</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                月ごとの記録数・記録日数・よく記録した活動ランキングを確認できます。カテゴリタブでは期間別の活動ごとの傾向も見られます。
              </p>
            </div>
            <div className="bg-card rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={14} className="text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">活動</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                活動の作成・編集・並び替えができます。使わなくなった活動はアーカイブするとホームから非表示になります。
              </p>
            </div>
            <div className="bg-card rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <Settings size={14} className="text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">設定</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                テーマの変更・パスワード変更・ログアウトができます。
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
