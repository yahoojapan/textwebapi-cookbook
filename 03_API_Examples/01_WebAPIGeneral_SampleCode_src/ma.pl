#!/usr/bin/env perl
use strict;
use warnings;
use LWP::UserAgent;
use JSON;
use utf8;
use open ':utf8';
binmode STDIN, ":utf8";
binmode STDOUT, ":utf8";

my $appid = "あなたの Client ID（アプリケーション ID）";
my $url = "https://jlp.yahooapis.jp/MAService/V2/parse";
my $ua = LWP::UserAgent->new;
$ua->default_header('Content-Type' => 'application/json');
$ua->default_header('User-Agent' => 'Yahoo AppID: '.$appid);

my $query = '今日は良い天気です。';
my $json_str = ma($query);
my $obj = JSON::decode_json($json_str);
print join(" ", (map {@$_[0,3]} @{$obj->{result}{tokens}}))."\n";

sub ma {
    my ($query) = @_;
    my $params = {
        "id" => "1",
        "jsonrpc" => "2.0",
        "method" => "jlp.maservice.parse",
        "params" => { "q" => $query }
    };
    my $response = $ua->post($url, content => JSON::encode_json($params));
    if ($response->is_success) {
        return $response->content;
    } else {
        die $response->status_line;
    }
}
